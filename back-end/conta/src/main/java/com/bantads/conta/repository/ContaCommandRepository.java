package com.bantads.conta.repository;

import com.bantads.conta.model.ContaCommand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository 
public interface ContaCommandRepository extends JpaRepository<ContaCommand, Long> {
}