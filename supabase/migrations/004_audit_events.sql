create table if not exists audit_events (                                 
    id uuid primary key default gen_random_uuid(),                        
    scan_id uuid,                 
    org_id uuid,          
    event_type text not null,                                             
    timestamp timestamptz not null default now(),                         
    actor text,                                                           
    target text,                                                          
    outcome text,                                                         
    risk_score float,                                                     
    owasp_category text,                                                  
    compliance_tags text[],                                               
    metadata jsonb,                                                       
    created_at timestamptz default now()      
);