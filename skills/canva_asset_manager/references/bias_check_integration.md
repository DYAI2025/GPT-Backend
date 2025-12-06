# Bias-Check Integration

Dieser Skill ist kompatibel mit dem `universal-bias-self-check`-Subskill.  
Typischer Einsatz:

```json
{
  "user_query": "Erstelle Bulk-TSV für Canva mit 5 Blogposts.",
  "candidate_answer": "<Agent-Output>",
  "skill_constraints": {
    "no_api_calls": true,
    "no_oauth": true
  }
}
```

Das Ergebnis enthält:
- Kategorisierte Claims (faktisch, logisch, subjektiv)
- Bias-Markierungen (Overconfidence, Confirmation)
- Handlungsempfehlungen zur Entschärfung.