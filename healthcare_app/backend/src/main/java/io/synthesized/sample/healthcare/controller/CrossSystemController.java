package io.synthesized.sample.healthcare.controller;

import io.synthesized.sample.healthcare.service.CrossSystemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/cross-system")
@CrossOrigin(origins = "*")
@Tag(name = "Cross-System Integration", description = "APIs for querying cross-system data between Healthcare and Insurance")
public class CrossSystemController {

    private final CrossSystemService crossSystemService;

    @Autowired
    public CrossSystemController(CrossSystemService crossSystemService) {
        this.crossSystemService = crossSystemService;
    }

    @Operation(
        summary = "Get insurance information for a patient",
        description = "Retrieves insurance policy information linked to a specific healthcare patient. Demonstrates cross-system referential integrity between Healthcare and Insurance systems.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Insurance information retrieved successfully"
            )
        }
    )
    @GetMapping("/patient/{patientId}/insurance")
    public ResponseEntity<Map<String, Object>> getInsuranceInfoForPatient(
            @Parameter(hidden = true)
            @RequestParam(defaultValue = "TESTING") String database,
            @Parameter(description = "Patient ID", required = true)
            @PathVariable Integer patientId) {
        Map<String, Object> insuranceInfo = crossSystemService.getInsuranceInfoForPatient(database, patientId);
        return ResponseEntity.ok(insuranceInfo);
    }

    @Operation(
        summary = "Get all patients with insurance links",
        description = "Retrieves all healthcare patients that have linked insurance policies. Shows the policy details for each patient.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Patients with insurance links retrieved successfully"
            )
        }
    )
    @GetMapping("/patients-with-insurance-links")
    public ResponseEntity<List<Map<String, Object>>> getPatientsWithInsuranceLinks(
            @Parameter(hidden = true)
            @RequestParam(defaultValue = "TESTING") String database) {
        List<Map<String, Object>> patients = crossSystemService.getPatientsWithInsuranceLinks(database);
        return ResponseEntity.ok(patients);
    }
}
