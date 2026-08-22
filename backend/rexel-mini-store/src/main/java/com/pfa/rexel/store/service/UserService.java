package com.pfa.rexel.store.service;

import com.pfa.rexel.store.dto.UpdateProfileRequest;
import com.pfa.rexel.store.dto.UserProfileResponse;
import com.pfa.rexel.store.exception.UserNotFoundException;
import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final Keycloak keycloakAdminClient;

    @Value("${app.keycloak.realm}")
    private String realm;

    public UserProfileResponse getProfile(Jwt jwt) {
        UserRepresentation user = fetchUser(jwt.getSubject());
        return toResponse(user, jwt);
    }

    public UserProfileResponse updateProfile(Jwt jwt, UpdateProfileRequest request) {
        UserResource userResource = keycloakAdminClient.realm(realm).users().get(jwt.getSubject());

        UserRepresentation user = fetchUser(jwt.getSubject());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.singleAttribute("phone", request.getPhone());

        userResource.update(user);

        return toResponse(user, jwt);
    }

    public String findPhoneByEmail(String email) {
        List<UserRepresentation> matches = keycloakAdminClient.realm(realm).users().searchByEmail(email, true);
        if (matches.isEmpty()) {
            return null;
        }
        Map<String, List<String>> attributes = matches.get(0).getAttributes();
        return attributes != null && attributes.containsKey("phone")
                ? attributes.get("phone").get(0)
                : null;
    }

    private UserRepresentation fetchUser(String keycloakUserId) {
        try {
            return keycloakAdminClient.realm(realm).users().get(keycloakUserId).toRepresentation();
        } catch (NotFoundException e) {
            throw new UserNotFoundException(keycloakUserId);
        }
    }

    private UserProfileResponse toResponse(UserRepresentation user, Jwt jwt) {
        Map<String, List<String>> attributes = user.getAttributes();
        String phone = attributes != null && attributes.containsKey("phone")
                ? attributes.get("phone").get(0)
                : null;

        return new UserProfileResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                phone,
                extractRole(jwt)
        );
    }

    @SuppressWarnings("unchecked")
    private String extractRole(Jwt jwt) {
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        if (realmAccess == null || realmAccess.get("roles") == null) {
            return "USER";
        }

        List<String> roles = (List<String>) realmAccess.get("roles");
        return roles.contains("ADMIN") ? "ADMIN" : "USER";
    }
}
