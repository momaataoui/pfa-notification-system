package com.pfa.rexel.store.service;

import com.pfa.rexel.store.dto.AdminStatsResponse;
import com.pfa.rexel.store.entity.OrderStatus;
import com.pfa.rexel.store.repository.OrderRepository;
import com.pfa.rexel.store.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.keycloak.admin.client.Keycloak;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AdminStatsService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final Keycloak keycloakAdminClient;

    @Value("${app.keycloak.realm}")
    private String realm;

    public AdminStatsResponse getStats() {
        BigDecimal totalRevenue = orderRepository.findAll().stream()
                .filter(order -> order.getStatus() != OrderStatus.CANCELLED)
                .map(order -> order.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long customerCount = keycloakAdminClient.realm(realm).users().count();

        return new AdminStatsResponse(
                productRepository.count(),
                orderRepository.count(),
                customerCount,
                orderRepository.countByStatus(OrderStatus.DELIVERED),
                orderRepository.countByStatus(OrderStatus.PENDING),
                orderRepository.countByStatus(OrderStatus.CANCELLED),
                totalRevenue
        );
    }
}
