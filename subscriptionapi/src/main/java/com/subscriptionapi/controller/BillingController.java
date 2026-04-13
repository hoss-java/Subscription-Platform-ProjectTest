package com.subscriptionapi.controller;

import com.subscriptionapi.dto.BillingCreateRequest;
import com.subscriptionapi.dto.BillingResponseDTO;
import com.subscriptionapi.dto.BillingUpdateRequest;
import com.subscriptionapi.dto.BillingInvoiceDTO;
import com.subscriptionapi.entity.BillingStatus;
import com.subscriptionapi.entity.BillingPeriod;
import com.subscriptionapi.jwt.JwtTokenProvider;
import com.subscriptionapi.service.BillingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/billings")
@RequiredArgsConstructor
public class BillingController {
    
    private final BillingService billingService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping("/billing-statuses")
    @PreAuthorize("isAuthenticated()") 
    public ResponseEntity<List<String>> getBillingStatuses() {
        List<String> billingStatuses = Arrays.stream(BillingStatus.values())
                .map(Enum::name)
                .toList();
        return ResponseEntity.ok(billingStatuses);
    }

    @GetMapping("/billing-periods")
    @PreAuthorize("isAuthenticated()") 
    public ResponseEntity<List<String>> getBillingPeriods() {
        List<String> billingPeriods = Arrays.stream(BillingPeriod.values())
                .map(Enum::name)
                .toList();
        return ResponseEntity.ok(billingPeriods);
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OPERATOR')")
    public ResponseEntity<BillingResponseDTO> createBilling(
            @Valid @RequestBody BillingCreateRequest request,
            @RequestHeader("Authorization") String token) {
        BillingResponseDTO billing = billingService.createBilling(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(billing);
    }

    @GetMapping("/my-billings")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<BillingResponseDTO>> getMyBillings(
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) Long subscriptionId,
            @RequestParam(required = false) String status) {
        Long userId = jwtTokenProvider.getUserIdFromToken(token.substring(7));
        List<BillingResponseDTO> billings = billingService.getBillingsByUserWithFilters(userId, subscriptionId, status);
        return ResponseEntity.ok(billings);
    }
    
    @GetMapping("/operator/issued")
    @PreAuthorize("hasRole('OPERATOR')")
    public ResponseEntity<List<BillingResponseDTO>> getBillingIssuedByOperator(
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) String status) {
        Long operatorId = jwtTokenProvider.getUserIdFromToken(token.substring(7));
        List<BillingResponseDTO> billings = billingService.getBillingIssuedByOperator(operatorId, status);
        return ResponseEntity.ok(billings);
    }

    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<BillingResponseDTO>> getBillingsByCustomer(
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) String status) {
        Long customerId = jwtTokenProvider.getUserIdFromToken(token.substring(7));
        List<BillingResponseDTO> billings = billingService.getBillingsByCustomer(customerId, status);
        return ResponseEntity.ok(billings);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OPERATOR')")
    public ResponseEntity<BillingInvoiceDTO> getBillingById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserIdFromToken(token.substring(7));
        BillingInvoiceDTO billing = billingService.getBillingByIdForUserOrOperator(id, userId);
        return ResponseEntity.ok(billing);
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OPERATOR')")
    public ResponseEntity<List<BillingResponseDTO>> getBillingsByUser(
            @RequestHeader("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserIdFromToken(token.substring(7));
        List<BillingResponseDTO> billings = billingService.getBillingsByUser(userId);
        return ResponseEntity.ok(billings);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OPERATOR')")
    public ResponseEntity<BillingResponseDTO> updateBillingStatus(
            @PathVariable Long id,
            @Valid @RequestBody BillingUpdateRequest request,
            @RequestHeader("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserIdFromToken(token.substring(7));
        BillingResponseDTO billing = billingService.updateBillingStatus(id, request.getStatus(), userId);
        return ResponseEntity.ok(billing);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OPERATOR')")
    public ResponseEntity<Void> deleteBilling(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserIdFromToken(token.substring(7));
        billingService.deleteBilling(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('OPERATOR')")
    public ResponseEntity<BillingResponseDTO> approveBillingPayment(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        Long operatorId = jwtTokenProvider.getUserIdFromToken(token.substring(7));
        BillingResponseDTO billing = billingService.approveBillingPayment(id, operatorId);
        return ResponseEntity.ok(billing);
    }
}
