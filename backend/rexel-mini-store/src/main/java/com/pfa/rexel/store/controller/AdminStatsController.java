package com.pfa.rexel.store.controller;

import com.pfa.rexel.store.dto.AdminStatsResponse;
import com.pfa.rexel.store.service.AdminStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
public class AdminStatsController {

    private final AdminStatsService adminStatsService;

    @GetMapping
    public AdminStatsResponse getStats() {
        return adminStatsService.getStats();
    }
}
