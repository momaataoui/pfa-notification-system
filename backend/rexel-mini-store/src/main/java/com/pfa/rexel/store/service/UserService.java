package com.pfa.rexel.store.service;

import com.pfa.rexel.store.dto.UpdateProfileRequest;
import com.pfa.rexel.store.entity.StoreUser;
import com.pfa.rexel.store.exception.EmailAlreadyUsedException;
import com.pfa.rexel.store.exception.UserNotFoundException;
import com.pfa.rexel.store.repository.StoreUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final StoreUserRepository storeUserRepository;

    public StoreUser getById(Long id) {
        return storeUserRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    public StoreUser updateProfile(Long id, UpdateProfileRequest request) {
        StoreUser user = getById(id);

        storeUserRepository.findByEmail(request.getEmail())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new EmailAlreadyUsedException(request.getEmail());
                });

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());

        return storeUserRepository.save(user);
    }
}
