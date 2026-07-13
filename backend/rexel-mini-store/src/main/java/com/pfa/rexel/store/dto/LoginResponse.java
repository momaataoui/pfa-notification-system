package com.pfa.rexel.store.dto;

import com.pfa.rexel.store.entity.StoreRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private StoreRole role;
}
