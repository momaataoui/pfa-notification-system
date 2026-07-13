package com.pfa.rexel.store.controller;

import com.pfa.rexel.store.dto.CustomerResponse;
import com.pfa.rexel.store.mapper.StoreUserMapper;
import com.pfa.rexel.store.repository.StoreUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/customers")
@RequiredArgsConstructor
public class AdminCustomerController {

    private final StoreUserRepository storeUserRepository;

    @GetMapping
    public List<CustomerResponse> getAllCustomers() {
        return storeUserRepository.findAll().stream()
                .map(StoreUserMapper::toCustomerResponse)
                .toList();
    }
}
