package com.pfa.rexel.store.controller;

import com.pfa.rexel.store.dto.CustomerResponse;
import lombok.RequiredArgsConstructor;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/customers")
@RequiredArgsConstructor
public class AdminCustomerController {

    private final Keycloak keycloakAdminClient;

    @Value("${app.keycloak.realm}")
    private String realm;

    @GetMapping
    public List<CustomerResponse> getAllCustomers() {
        return keycloakAdminClient.realm(realm).users().list().stream()
                .map(this::toCustomerResponse)
                .toList();
    }

    private CustomerResponse toCustomerResponse(UserRepresentation user) {
        String phone = user.getAttributes() != null && user.getAttributes().containsKey("phone")
                ? user.getAttributes().get("phone").get(0)
                : null;

        return new CustomerResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                phone
        );
    }
}
