package com.bantads.gerente.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GerenteDashboardDTO {
    
    private GerenteResponseDTO gerente; 
    
    @Builder.Default
    private List<Object> clientes = new ArrayList<>(); 
    
    @JsonProperty("saldo_positivo")
    @Builder.Default
    private Double saldoPositivo = 0.0;
    
    @JsonProperty("saldo_negativo")
    @Builder.Default
    private Double saldoNegativo = 0.0;
}