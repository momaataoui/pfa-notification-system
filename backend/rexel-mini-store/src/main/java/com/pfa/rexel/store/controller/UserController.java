package com.pfa.rexel.store.controller;

import com.pfa.rexel.store.dto.LoginResponse;
import com.pfa.rexel.store.dto.UpdateProfileRequest;
import com.pfa.rexel.store.entity.StoreUser;
import com.pfa.rexel.store.mapper.StoreUserMapper;
import com.pfa.rexel.store.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public LoginResponse getProfile(@PathVariable Long id) {
        StoreUser user = userService.getById(id);
        return StoreUserMapper.toLoginResponse(user);
    }

    @PutMapping("/{id}")
    public LoginResponse updateProfile(@PathVariable Long id, @Valid @RequestBody UpdateProfileRequest request) {
        StoreUser user = userService.updateProfile(id, request);
        return StoreUserMapper.toLoginResponse(user);
    }
}
