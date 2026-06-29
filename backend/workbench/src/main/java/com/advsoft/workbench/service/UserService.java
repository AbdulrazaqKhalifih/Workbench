package com.advsoft.workbench.service;

import com.advsoft.workbench.dto.request.UpdateMeDTO;
import com.advsoft.workbench.dto.response.MeDTO;
import com.advsoft.workbench.dto.response.SessionDTO;
import com.advsoft.workbench.enums.UserStatus;
import com.advsoft.workbench.exception.UpdateUserException;
import com.advsoft.workbench.model.RefreshToken;
import com.advsoft.workbench.model.Role;
import com.advsoft.workbench.model.User;
import com.advsoft.workbench.repository.RefreshTokenRepository;
import com.advsoft.workbench.repository.RoleRepository;
import com.advsoft.workbench.repository.UserRepository;
import com.advsoft.workbench.util.PasswordUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final RefreshTokenRepository refreshRepo;
    private final PasswordEncoder passwordEncoder;
    private final TokenHashingService tokenHashingService;


    @Transactional(readOnly = true)
    @Cacheable(value = "users", key = "#userId")
    public MeDTO getUserById(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return toDTO(user);
    }

    @Transactional
    @CachePut(value = "users", key = "#userId")
    public MeDTO updateUser(Long userId, UpdateMeDTO updateMeDTO) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (updateMeDTO.getEmail() != null) {
            user.changeEmail(updateMeDTO.getEmail());
        }
        if (updateMeDTO.getStatus() != null &&
                !(updateMeDTO.getStatus() == UserStatus.ACTIVE) &&
                !(updateMeDTO.getStatus() == user.getStatus())) {
            user.changeStatus(updateMeDTO.getStatus());
        }
        if (updateMeDTO.getNewPassword() != null
                && updateMeDTO.getConfirmPassword() != null
                && updateMeDTO.getOldPassword() != null) {

            if (user.getPasswordHash()
                    .equals(passwordEncoder.encode(updateMeDTO.getOldPassword()))) {
                PasswordUtils.validatePassword(updateMeDTO.getNewPassword(), updateMeDTO.getConfirmPassword());
            }else{
                throw new UpdateUserException("Old Password isn't correct");
            }
        }

        return toDTO(userRepo.save(user));
    }

    @Transactional(readOnly = true)
    private MeDTO toDTO(User user) {
        List<Role> roles = roleRepo.findAllByUserId(user.getId());
        return MeDTO.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .roles(roles.stream()
                        .map(Role::getName)
                        .toList())
                .status(user.getStatus())
                .build();
    }

    public List<SessionDTO> getActiveSessions(Long userId, String rawRefreshToken) {
        List<RefreshToken> tokens = refreshRepo.findActiveByUserId(userId);

        return tokens.stream()
                .map(token -> SessionDTO.builder()
                        .deviceName(token.getDeviceName())
                        .ipAddress(token.getIpAddress())
                        .lastActive(token.getCreatedAt())
                        .isCurrent(isCurrentSession(token, rawRefreshToken))
                        .tokenId(token.getId())
                        .build())
                .toList();
    }

    @CacheEvict(value = "users", key = "#userId")
    public void evictUserCache(Long userId) {
        // no-op — annotation does the work
    }

    // Helper to identify current session
    private boolean isCurrentSession(RefreshToken token, String rawRefreshToken) {
        if (rawRefreshToken == null) return false;

        String currentHash = tokenHashingService.sha256Base64(rawRefreshToken);
        return token.getTokenHash().equals(currentHash);
    }
}
