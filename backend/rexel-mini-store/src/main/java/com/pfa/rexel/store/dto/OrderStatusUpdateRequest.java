package com.pfa.rexel.store.dto;

import com.pfa.rexel.store.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderStatusUpdateRequest {

    @NotNull
    private OrderStatus status;
}
