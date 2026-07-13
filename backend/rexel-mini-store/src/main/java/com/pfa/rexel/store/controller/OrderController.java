package com.pfa.rexel.store.controller;

import com.pfa.rexel.store.dto.OrderRequest;
import com.pfa.rexel.store.dto.OrderResponse;
import com.pfa.rexel.store.entity.Order;
import com.pfa.rexel.store.mapper.OrderMapper;
import com.pfa.rexel.store.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest request) {
        Order order = orderService.placeOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(OrderMapper.toDto(order));
    }

    @GetMapping("/my")
    public List<OrderResponse> getMyOrders(@RequestParam String email) {
        return orderService.getOrdersForCustomer(email).stream()
                .map(OrderMapper::toDto)
                .toList();
    }

    @PatchMapping("/{id}/cancel")
    public OrderResponse cancelOrder(@PathVariable Long id) {
        return OrderMapper.toDto(orderService.cancelOrder(id));
    }

    @PatchMapping("/{id}/pay")
    public OrderResponse payOrder(@PathVariable Long id) {
        return OrderMapper.toDto(orderService.payOrder(id));
    }
}
