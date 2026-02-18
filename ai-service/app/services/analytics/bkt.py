class BayesianKnowledgeTracing:
    """
    Implements standard Bayesian Knowledge Tracing (BKT) model.
    Tracks probability of mastery P(L) for a skill/topic.
    """

    def __init__(self, p_init=0.5, p_transit=0.1, p_guess=0.2, p_slip=0.1):
        self.p_init = p_init       # Initial probability of mastery
        self.p_transit = p_transit # Probability of learning the skill (Transition)
        self.p_guess = p_guess     # Probability of guessing correctly
        self.p_slip = p_slip       # Probability of slipping (mistake despite knowing)

    def update(self, p_known: float, is_correct: bool) -> float:
        """
        Updates the probability of mastery based on the observation (is_correct).
        Returns the new P(L) (posterior).
        """
        if is_correct:
            # P(L|Correct) = (P(L) * (1 - P(S))) / (P(L) * (1 - P(S)) + (1 - P(L)) * P(G))
            prob_learned_given_obs = (p_known * (1 - self.p_slip)) / \
                                     (p_known * (1 - self.p_slip) + (1 - p_known) * self.p_guess)
        else:
            # P(L|Incorrect) = (P(L) * P(S)) / (P(L) * P(S) + (1 - P(L)) * (1 - P(G)))
            prob_learned_given_obs = (p_known * self.p_slip) / \
                                     (p_known * self.p_slip + (1 - p_known) * (1 - self.p_guess))

        # P(L_t) = P(L|Obs) + (1 - P(L|Obs)) * P(T)
        p_new = prob_learned_given_obs + (1 - prob_learned_given_obs) * self.p_transit

        return p_new

    def predict_correctness(self, p_known: float) -> float:
        """
        Predicts the probability of getting the next question correct.
        P(Correct) = P(L) * (1 - P(S)) + (1 - P(L)) * P(G)
        """
        return p_known * (1 - self.p_slip) + (1 - p_known) * self.p_guess
