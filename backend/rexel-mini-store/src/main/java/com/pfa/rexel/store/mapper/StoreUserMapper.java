package com.pfa.rexel.store.mapper;

import com.pfa.rexel.store.dto.CustomerResponse;
import com.pfa.rexel.store.dto.LoginResponse;
import com.pfa.rexel.store.entity.StoreUser;

public class StoreUserMapper {

    private StoreUserMapper() {
    }

    public static LoginResponse toLoginResponse(StoreUser user) {
        return new LoginResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole()
        );
    }

    public static CustomerResponse toCustomerResponse(StoreUser user) {
        return new CustomerResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone()
        );
    }
}
