package com.pfa.rexel.store.service;

import com.pfa.rexel.store.dto.AdminStatsResponse;
import com.pfa.rexel.store.entity.OrderStatus;
import com.pfa.rexel.store.repository.OrderRepository;
import com.pfa.rexel.store.repository.ProductRepository;
import com.pfa.rexel.store.repository.StoreUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AdminStatsService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final StoreUserRepository storeUserRepository;

    public AdminStatsResponse getStats() {
        BigDecimal totalRevenue = orderRepository.findAll().stream()
                .filter(order -> order.getStatus() != OrderStatus.CANCELLED)
                .map(order -> order.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new AdminStatsResponse(
                productRepository.count(),
                orderRepository.count(),
                storeUserRepository.count(),
                orderRepository.countByStatus(OrderStatus.DELIVERED),
                orderRepository.countByStatus(OrderStatus.PENDING),
                orderRepository.countByStatus(OrderStatus.CANCELLED),
                totalRevenue
        );
    }
}
