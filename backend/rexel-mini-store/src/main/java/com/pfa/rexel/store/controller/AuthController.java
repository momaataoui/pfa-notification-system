package com.pfa.rexel.store.controller;

import com.pfa.rexel.store.dto.LoginRequest;
import com.pfa.rexel.store.dto.LoginResponse;
import com.pfa.rexel.store.dto.RegisterRequest;
import com.pfa.rexel.store.entity.StoreUser;
import com.pfa.rexel.store.mapper.StoreUserMapper;
import com.pfa.rexel.store.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        StoreUser user = authService.login(request);
        return StoreUserMapper.toLoginResponse(user);
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        StoreUser user = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(StoreUserMapper.toLoginResponse(user));
    }
}
