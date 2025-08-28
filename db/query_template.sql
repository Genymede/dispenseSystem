INSERT INTO med_table (
    med_name, med_generic_name, med_severity, med_counting_unit, med_marketing_name, 
    med_thai_name, med_cost_price, med_selling_price, med_medium_price, med_dosage_form, 
    med_medical_category, med_essential_med_list, med_out_of_stock, med_replacement, 
    "med_TMT_GP_name", "med_TMT_TP_name", med_quantity, med_dose_dialogue, "med_TMT_code", 
    "med_TPU_code", med_pregnancy_cagetory, med_set_new_price, "mde_dispence_IPD_freq", 
    med_mfg, med_exp
)
VALUES
    ('TESTTTTTT', 'Acetaminophen', 'Mild', 'Tablet', 'ParaMax', 
     'พาราเซตามอล', 1.5, 2.0, 1.75, 'Oral', 
     'Analgesic', 'Y', false, NULL, 
     'TMT001', 'TP001', 500, 'Take 1 tablet every 6 hours', 'T001', 
     'TPU001', 'A', false, 5, 
     '2025-03-01', '2027-03-01');