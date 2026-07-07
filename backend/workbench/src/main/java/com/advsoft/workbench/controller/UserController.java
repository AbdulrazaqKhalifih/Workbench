package com.advsoft.workbench.controller;

import com.advsoft.workbench.dto.response.UserSummaryDTO;
import com.advsoft.workbench.model.User;
import com.advsoft.workbench.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/by-email")
    public ResponseEntity<UserSummaryDTO> getByEmail(@RequestParam String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(UserSummaryDTO.fromEntity(user));
    }
}