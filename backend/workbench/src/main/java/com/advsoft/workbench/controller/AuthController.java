package com.advsoft.workbench.controller;

import com.advsoft.workbench.dto.auth.AuthTokenResult;
import com.advsoft.workbench.dto.auth.ClientInfo;
import com.advsoft.workbench.dto.request.*;
import com.advsoft.workbench.dto.request.*;
import com.advsoft.workbench.dto.response.AuthenticationDTO;
import com.advsoft.workbench.dto.response.MessageResponseDTO;
import com.advsoft.workbench.exception.InvalidCredentialsException;
import com.advsoft.workbench.service.AuthService;
import com.advsoft.workbench.service.RefreshCookieService;
import com.advsoft.workbench.service.ResetPasswordCookieService;
import com.advsoft.workbench.util.RequestResponseHelper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final RefreshCookieService refreshCookieService;
    private final ResetPasswordCookieService resetPasswordCookieService;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationDTO> register(@Valid @RequestBody RegisterDTO registerDTO, HttpServletRequest request) {
        AuthTokenResult result = authService.register(registerDTO, buildClientInfo(request));
        return tokenResponse(result, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationDTO> login(@Valid @RequestBody LoginDTO loginDTO, HttpServletRequest request) {
        AuthTokenResult result = authService.login(loginDTO, buildClientInfo(request));
        return tokenResponse(result, HttpStatus.OK);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthenticationDTO> refresh(HttpServletRequest request) {
        String rawRefreshToken = refreshCookieService.readRefreshCookie(request);
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new InvalidCredentialsException();
        }

        AuthTokenResult result = authService.refresh(rawRefreshToken, buildClientInfo(request));
        return tokenResponse(result, HttpStatus.CREATED);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        String rawRefreshToken = refreshCookieService.readRefreshCookie(request);
        String authorizationHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        authService.logout(rawRefreshToken, authorizationHeader);

        ResponseCookie cookie = refreshCookieService.createClearRefreshCookie();
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    @PostMapping("/password/reset/start")
    public ResponseEntity<MessageResponseDTO> startReset(@RequestBody @Valid EmailRequestDTO req) {
        authService.startPasswordReset(req.getEmail());
        return ResponseEntity.ok(MessageResponseDTO.builder()
                .message("If an account was found we sent an email")
                .build()
        );
    }

    @PostMapping("/password/reset/verify")
    public ResponseEntity<?> verifyCode(@RequestBody @Valid PasswordResetVerifyRequestDTO req) {
        String rawResetSession = authService.verifyResetCode(req.getEmail(), req.getCode());
        ResponseCookie cookie = resetPasswordCookieService.create(rawResetSession);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    @PostMapping("/password/reset/complete")
    public ResponseEntity<?> completeReset(@CookieValue("wb_reset_session") String resetSession, @Valid @RequestBody PasswordResetCompleteRequestDTO req) {
        authService.completePasswordReset(resetSession, req.getNewPassword());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE,
                        resetPasswordCookieService.clear().toString())
                .build();
    }

    @GetMapping("/internal/test/last-reset-code?email={resetEmail}")
    public ResponseEntity<String> getResetCode(@PathVariable("resetEmail") String email) {
        return ResponseEntity.ok(authService.getLastResetCode(email));
    }

    private ClientInfo buildClientInfo(HttpServletRequest request) {
        String userAgent = request.getHeader(HttpHeaders.USER_AGENT);
        return new ClientInfo(
                userAgent,
                RequestResponseHelper.getClientIpAddress(request),
                RequestResponseHelper.parseDeviceName(userAgent)
        );
    }

    private ResponseEntity<AuthenticationDTO> tokenResponse(AuthTokenResult result, HttpStatus status) {
        ResponseCookie cookie = refreshCookieService.createRefreshCookie(
                result.rawRefreshToken(),
                result.refreshTtlSeconds()
        );

        return ResponseEntity.status(status)
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(result.body());
    }
}
