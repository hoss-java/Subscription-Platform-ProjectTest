package com.subscriptionapi.controller;

import com.subscriptionapi.dto.BillingCreateRequest;
import com.subscriptionapi.dto.BillingResponseDTO;
import com.subscriptionapi.dto.BillingUpdateRequest;
import com.subscriptionapi.entity.BillingStatus;
import com.subscriptionapi.jwt.JwtTokenProvider;
import com.subscriptionapi.service.BillingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/billings")
@RequiredArgsConstructor
public class BillingController {
    
    private final BillingService billingService;
    private final JwtTokenProvider jwtTokenProvider;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OPERATOR')")
    public ResponseEntity<BillingResponseDTO> createBilling(
            @Valid @RequestBody BillingCreateRequest request,
            @RequestHeader("Authorization") String token) {
        BillingResponseDTO billing = billingService.createBilling(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(billing);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OPERATOR')")
    public ResponseEntity<BillingResponseDTO> getBillingById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserIdFromToken(token.substring(7));
        BillingResponseDTO billing = billingService.getBillingByIdForUser(id, userId);
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
            @Valid @RequestBody BillingUpdateRequest request) {
        BillingResponseDTO billing = billingService.updateBillingStatus(id, request.getStatus());
        return ResponseEntity.ok(billing);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OPERATOR')")
    public ResponseEntity<Void> deleteBilling(@PathVariable Long id) {
        billingService.deleteBilling(id);
        return ResponseEntity.noContent().build();
    }
}
