package com.user.loginapp.service;

import com.user.loginapp.dto.AuthRequest;
import com.user.loginapp.entity.User;
import com.user.loginapp.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<User> register(AuthRequest req) {
        if (req.getUsername() == null || req.getPassword() == null) {
            return Optional.empty();
        }
        if (userRepository.findByUsername(req.getUsername()).isPresent()) {
            return Optional.empty();
        }
        String hashed = passwordEncoder.encode(req.getPassword());
        User u = new User(req.getUsername(), hashed, req.getFullName());
        User saved = userRepository.save(u);
        return Optional.of(saved);
    }

    public Optional<User> login(AuthRequest req) {
        if (req.getUsername() == null || req.getPassword() == null) {
            return Optional.empty();
        }
        Optional<User> userOpt = userRepository.findByUsername(req.getUsername());
        if (userOpt.isEmpty()) return Optional.empty();
        User user = userOpt.get();
        if (passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            return Optional.of(user);
        }
        return Optional.empty();
    }
}
