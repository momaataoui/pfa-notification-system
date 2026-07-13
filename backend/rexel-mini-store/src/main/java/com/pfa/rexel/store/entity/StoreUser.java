package com.pfa.rexel.store.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "store_users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StoreUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;

    private String lastName;

    private String email;

    private String phone;

    /**
     * Login simule pour la demo du mini-store : pas de hash, pas de JWT.
     * La vraie authentification (JWT, roles ADMIN/USER) est prevue dans notification-service.
     */
    private String password;

    @Enumerated(EnumType.STRING)
    private StoreRole role;
}
