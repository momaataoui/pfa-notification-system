package com.pfa.rexel.store.service;

import com.pfa.rexel.store.dto.LoginRequest;
import com.pfa.rexel.store.dto.RegisterRequest;
import com.pfa.rexel.store.entity.StoreRole;
import com.pfa.rexel.store.entity.StoreUser;
import com.pfa.rexel.store.exception.EmailAlreadyUsedException;
import com.pfa.rexel.store.exception.InvalidCredentialsException;
import com.pfa.rexel.store.repository.StoreUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final StoreUserRepository storeUserRepository;

    public StoreUser login(LoginRequest request) {
        StoreUser user = storeUserRepository.findByEmail(request.getEmail())
                .orElseThrow(InvalidCredentialsException::new);

        if (!user.getPassword().equals(request.getPassword())) {
            throw new InvalidCredentialsException();
        }

        return user;
    }

    public StoreUser register(RegisterRequest request) {
        if (storeUserRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new EmailAlreadyUsedException(request.getEmail());
        }

        StoreUser user = new StoreUser();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(request.getPassword());
        user.setRole(StoreRole.USER);

        return storeUserRepository.save(user);
    }
}
