package com.pfa.rexel.store.service;

import com.pfa.rexel.store.dto.ProductRequestCreateRequest;
import com.pfa.rexel.store.entity.ProductRequest;
import com.pfa.rexel.store.entity.ProductRequestStatus;
import com.pfa.rexel.store.exception.ProductRequestNotFoundException;
import com.pfa.rexel.store.repository.ProductRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductRequestService {

    private static final String ADMIN_EMAIL = "moomaataoui@gmail.com";

    private final ProductRequestRepository productRequestRepository;
    private final KafkaEventPublisher kafkaEventPublisher;

    @Transactional
    public ProductRequest create(ProductRequestCreateRequest request) {
        ProductRequest productRequest = new ProductRequest();
        productRequest.setCustomerFirstName(request.getCustomerFirstName());
        productRequest.setCustomerLastName(request.getCustomerLastName());
        productRequest.setCustomerEmail(request.getCustomerEmail());
        productRequest.setProductName(request.getProductName());
        productRequest.setDescription(request.getDescription());
        productRequest.setStatus(ProductRequestStatus.PENDING);
        productRequest.setCreatedAt(LocalDateTime.now());

        ProductRequest saved = productRequestRepository.save(productRequest);

        kafkaEventPublisher.publish(
                ADMIN_EMAIL,
                request.getCustomerFirstName() + " " + request.getCustomerLastName()
                        + " demande le produit \"" + request.getProductName() + "\"",
                "PRODUCT_REQUEST_CREATED",
                "normal"
        );

        return saved;
    }

    public List<ProductRequest> getForCustomer(String email) {
        return productRequestRepository.findByCustomerEmail(email, Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public List<ProductRequest> getAll(ProductRequestStatus status) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        return status != null
                ? productRequestRepository.findByStatus(status, sort)
                : productRequestRepository.findAll(sort);
    }

    @Transactional
    public ProductRequest approve(Long id) {
        ProductRequest request = productRequestRepository.findById(id)
                .orElseThrow(() -> new ProductRequestNotFoundException(id));

        request.setStatus(ProductRequestStatus.APPROVED);
        ProductRequest saved = productRequestRepository.save(request);

        kafkaEventPublisher.publish(
                saved.getCustomerEmail(),
                "Votre demande pour \"" + saved.getProductName() + "\" a ete approuvee",
                "PRODUCT_REQUEST_APPROVED",
                "normal"
        );

        return saved;
    }

    @Transactional
    public ProductRequest reject(Long id) {
        ProductRequest request = productRequestRepository.findById(id)
                .orElseThrow(() -> new ProductRequestNotFoundException(id));

        request.setStatus(ProductRequestStatus.REJECTED);
        ProductRequest saved = productRequestRepository.save(request);

        kafkaEventPublisher.publish(
                saved.getCustomerEmail(),
                "Votre demande pour \"" + saved.getProductName() + "\" a ete refusee",
                "PRODUCT_REQUEST_REJECTED",
                "normal"
        );

        return saved;
    }
}
