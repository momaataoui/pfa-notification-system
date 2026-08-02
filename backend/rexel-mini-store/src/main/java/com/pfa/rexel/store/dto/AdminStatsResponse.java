package com.pfa.rexel.store.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    private long productCount;
    private long orderCount;
    private long customerCount;
    private long deliveredCount;
    private long pendingCount;
    private long cancelledCount;
    private BigDecimal totalRevenue;
    private long unreadOrderCount;
}
