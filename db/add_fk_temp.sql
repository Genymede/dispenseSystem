ALTER TABLE patient
ADD CONSTRAINT fk_patient_address_id
FOREIGN KEY (patient_addr_id) REFERENCES patient_address(address_id)
ON DELETE SET NULL
ON UPDATE CASCADE;