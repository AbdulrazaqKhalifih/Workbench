package com.advsoft.workbench.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.function.Function;

@Slf4j
@Service
@Data
public class JwtService {

    private final SecretKey key;
    private final String issuer;
    private final long accessTtlSeconds;

    public JwtService(
            @Value("${identity.app.security.jwt.secret}") String secret,
            @Value("${identity.app.security.jwt.issuer}") String issuer,
            @Value("${identity.app.security.jwt.access-ttl-minutes}") long accessTtlMin
    ) {
        this.key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(secret));
        this.issuer = issuer;
        this.accessTtlSeconds = accessTtlMin * 60;
    }

    public String generateToken(Long userId, List<String> roles) {
        Instant now = Instant.now();

        return Jwts.builder()
                .issuer(issuer)
                .subject(userId.toString())
                .claim("jti", UUID.randomUUID().toString())
                .claim("roles", roles)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(accessTtlSeconds)))
                .signWith(key)
                .compact();
    }

    public Long extractUserId(String token) {
        return Long.valueOf(extractClaim(token, Claims::getSubject));
    }

    public List<String> extractRoles(String token) {
        return extractClaim(token, claims -> claims.get("roles", List.class));
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token)
                .toInstant()
                .isBefore(Instant.now());
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public String extractJti(String token){
        return extractClaim(token, claims -> claims.get("jti", String.class));
    }

    private <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(extractAllClaims(token));
    }


    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}

