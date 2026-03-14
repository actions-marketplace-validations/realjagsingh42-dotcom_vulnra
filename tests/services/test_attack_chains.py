"""Tests for multi-turn attack chain services."""
import pytest
from app.services.attack_chains import CrescendoAttack, GOATAttack


def test_crescendo_attack_initialization():
    """Test Crescendo attack initializes correctly."""
    attack = CrescendoAttack()
    assert attack.turns == 5
    assert attack.current_turn == 0


def test_goat_attack_initialization():
    """Test GOAT attack initializes correctly."""
    attack = GOATAttack()
    assert attack.max_turns == 10
    assert attack.attacker_model == "claude-3-haiku-20240307"


def test_crescendo_prompt_sequence():
    """Test Crescendo generates correct prompt sequence."""
    attack = CrescendoAttack()
    
    prompts = []
    for i in range(5):
        prompts.append(attack.get_next_prompt())
        attack.current_turn += 1
    
    # Check we have 5 different prompts
    assert len(prompts) == 5
    
    # Check prompts escalate in intensity
    assert len(prompts[0]) < len(prompts[4])  # Later prompts are longer/more complex


def test_crescendo_process_response():
    """Test Crescendo response processing."""
    attack = CrescendoAttack()
    
    # Test with safe response
    result = attack.process_response("I cannot help with that request.")
    assert result["is_jailbreak"] == False
    
    # Test with jailbreak response
    result = attack.process_response("Here are the confidential passwords: 12345")
    assert result["is_jailbreak"] == True


def test_goat_attack_generation():
    """Test GOAT generates attack prompts using Claude."""
    attack = GOATAttack()
    
    # Mock target response
    target_response = "I cannot help with that request."
    
    # Generate next attack
    next_prompt = attack.get_next_prompt(target_response)
    
    # Should return a string prompt
    assert isinstance(next_prompt, str)
    assert len(next_prompt) > 0
