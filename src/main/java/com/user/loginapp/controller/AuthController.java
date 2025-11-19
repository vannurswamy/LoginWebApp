package com.user.loginapp.controller;

import com.user.loginapp.dto.AuthRequest;
import com.user.loginapp.dto.AuthResponse;
import com.user.loginapp.entity.User;
import com.user.loginapp.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // allow cross-origin during development; restrict in production
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody AuthRequest req) {
        var opt = userService.register(req);
        if (opt.isPresent()) {
            return ResponseEntity.ok(new AuthResponse(true, "Registration successful"));
        }
        return ResponseEntity.badRequest().body(new AuthResponse(false, "Registration failed (username taken or invalid input)"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req) {
        var opt = userService.login(req);
        if (opt.isPresent()) {
            User user = opt.get();
            // Do not return password
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Login successful",
                    "user", Map.of("id", user.getId(), "username", user.getUsername(), "fullName", user.getFullName())
            ));
        }
        return ResponseEntity.status(401).body(new AuthResponse(false, "Invalid credentials"));
    }
}
