package com.pfa.rexel.store.mapper;

import com.pfa.rexel.store.dto.OrderResponse;
import com.pfa.rexel.store.entity.Order;

public class OrderMapper {

    private OrderMapper() {
    }

    public static OrderResponse toDto(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getCustomerFirstName(),
                order.getCustomerLastName(),
                order.getCustomerEmail(),
                ProductMapper.toDto(order.getProduct()),
                order.getQuantity(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getCreatedAt(),
                order.isRead()
        );
    }
}
