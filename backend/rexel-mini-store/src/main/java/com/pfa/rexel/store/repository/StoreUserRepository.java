package com.pfa.rexel.store.repository;

import com.pfa.rexel.store.entity.StoreUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StoreUserRepository extends JpaRepository<StoreUser, Long> {

    Optional<StoreUser> findByEmail(String email);
}
