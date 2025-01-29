package com.capx.portfolio_tracker_backend.repository;
import com.capx.portfolio_tracker_backend.models.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {
   
}

