package com.pfa.rexel.store.controller;

import com.pfa.rexel.store.dto.OrderResponse;
import com.pfa.rexel.store.dto.OrderStatusUpdateRequest;
import com.pfa.rexel.store.entity.OrderStatus;
import com.pfa.rexel.store.mapper.OrderMapper;
import com.pfa.rexel.store.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public List<OrderResponse> getAllOrders(@RequestParam(required = false) OrderStatus status) {
        return orderService.getAllOrders(status).stream()
                .map(OrderMapper::toDto)
                .toList();
    }

    @PatchMapping("/{id}/status")
    public OrderResponse updateStatus(@PathVariable Long id, @Valid @RequestBody OrderStatusUpdateRequest request) {
        return OrderMapper.toDto(orderService.updateStatus(id, request.getStatus()));
    }

    @PatchMapping("/{id}/read")
    public OrderResponse markAsRead(@PathVariable Long id) {
        return OrderMapper.toDto(orderService.markAsRead(id));
    }
}
