package com.advsoft.workbench.controller;

import com.advsoft.workbench.dto.request.UpdateMeDTO;
import com.advsoft.workbench.dto.response.MeDTO;
import com.advsoft.workbench.dto.response.SessionDTO;
import com.advsoft.workbench.service.RefreshCookieService;
import com.advsoft.workbench.service.UserService;
import com.advsoft.workbench.util.SecurityContextHelper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/me")
@RequiredArgsConstructor
public class MeController {
    private final UserService userService;
    private final RefreshCookieService refreshCookieService;

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<MeDTO> me() {
        Long userId = SecurityContextHelper.getCurrentUserId();

        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @PutMapping
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<MeDTO> updateMe(@RequestBody UpdateMeDTO updateMeDTO){
        Long userId = SecurityContextHelper.getCurrentUserId();
        return ResponseEntity.ok(userService.updateUser(userId, updateMeDTO));
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<SessionDTO>> getActiveSessions(HttpServletRequest request) {
        Long userId = SecurityContextHelper.getCurrentUserId();
        String rawRefreshToken = refreshCookieService.readRefreshCookie(request);
        return ResponseEntity.ok(userService.getActiveSessions(userId, rawRefreshToken));
    }
}
