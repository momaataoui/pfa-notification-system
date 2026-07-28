package com.pfa.rexel.store.service;

import com.pfa.rexel.store.dto.OrderRequest;
import com.pfa.rexel.store.entity.Order;
import com.pfa.rexel.store.entity.OrderStatus;
import com.pfa.rexel.store.entity.Product;
import com.pfa.rexel.store.exception.InsufficientStockException;
import com.pfa.rexel.store.exception.InvalidOrderStatusException;
import com.pfa.rexel.store.exception.OrderNotFoundException;
import com.pfa.rexel.store.exception.ProductNotFoundException;
import com.pfa.rexel.store.repository.OrderRepository;
import com.pfa.rexel.store.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final KafkaEventPublisher kafkaEventPublisher;

    @Transactional
    public Order placeOrder(OrderRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ProductNotFoundException(request.getProductId()));

        if (product.getStockQuantity() < request.getQuantity()) {
            throw new InsufficientStockException(product.getId());
        }

        product.setStockQuantity(product.getStockQuantity() - request.getQuantity());
        productRepository.save(product);

        Order order = new Order();
        order.setCustomerFirstName(request.getCustomerFirstName());
        order.setCustomerLastName(request.getCustomerLastName());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setProduct(product);
        order.setQuantity(request.getQuantity());
        order.setTotalAmount(product.getPrice().multiply(BigDecimal.valueOf(request.getQuantity())));
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());

        Order saved = orderRepository.save(order);

        kafkaEventPublisher.publish(
                saved.getCustomerEmail(),
                "Commande #" + saved.getId() + " enregistree pour " + product.getName(),
                "ORDER_CREATED",
                "normal"
        );

        if (product.getStockQuantity() < 10) {
            kafkaEventPublisher.publish(
                    "admin@rexel.com",
                    "Stock faible pour " + product.getName() + " : " + product.getStockQuantity() + " unites restantes",
                    "LOW_STOCK_ALERT",
                    "high"
            );
        }

        return saved;
    }

    public List<Order> getOrdersForCustomer(String email) {
        return orderRepository.findByCustomerEmail(email, Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public List<Order> getAllOrders(OrderStatus status) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        return status != null
                ? orderRepository.findByStatus(status, sort)
                : orderRepository.findAll(sort);
    }

    @Transactional
    public Order cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new InvalidOrderStatusException("Seules les commandes en attente peuvent etre annulees");
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order saved = orderRepository.save(order);
        kafkaEventPublisher.publish(saved.getCustomerEmail(), "Commande #" + saved.getId() + " annulee", "ORDER_CANCELLED", "normal");
        return saved;
    }

    @Transactional
    public Order updateStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        order.setStatus(status);
        Order saved = orderRepository.save(order);

        String eventType = switch (status) {
            case SHIPPED -> "ORDER_SHIPPED";
            case DELIVERED -> "ORDER_DELIVERED";
            case CANCELLED -> "ORDER_CANCELLED";
            default -> null;
        };

        if (eventType != null) {
            kafkaEventPublisher.publish(saved.getCustomerEmail(), "Commande #" + saved.getId() + " : " + eventType, eventType, "normal");
        }

        return saved;
    }
}
