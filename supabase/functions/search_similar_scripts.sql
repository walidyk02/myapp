CREATE OR REPLACE FUNCTION search_similar_scripts(p_query TEXT, p_limit INT DEFAULT 3)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    description TEXT,
    script_content TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rs.id,
        rs.name,
        rs.description,
        rs.script_content,
        ts_rank(rs.search_vector, query_vector) as similarity
    FROM 
        reference_scripts rs,
        to_tsquery('french', regexp_replace(p_query, '\s+', ' & ', 'g')) query_vector
    WHERE 
        rs.search_vector @@ query_vector
    ORDER BY 
        similarity DESC
    LIMIT p_limit;
END;
$$;
