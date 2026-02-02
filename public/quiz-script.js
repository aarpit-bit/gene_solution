// Correct answers
const correctAnswers = {
  q1: 'B',
  q2: 'B',
  q3: 'B',
  q4: 'B',
  q5: 'C',
  q6: 'C'
};
console.log('📝 Quiz script loaded successfully');
// Get form elements
const quizForm = document.getElementById('quizForm');
const submitBtn = document.getElementById('submitBtn');
const resultsSummary = document.getElementById('resultsSummary');
const proceedBtn = document.getElementById('proceedBtn');
// Form submission handler
if (quizForm) {
  quizForm.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('📝 Quiz form submitted');
    
    // Check if all questions are answered
    let allAnswered = true;
    const unansweredQuestions = [];
    
    for (let i = 1; i <= 6; i++) {
      const answer = document.querySelector(`input[name="q${i}"]:checked`);
      if (!answer) {
        allAnswered = false;
        unansweredQuestions.push(i);
      }
    }
    
    if (!allAnswered) {
      // Highlight unanswered questions
      showUnansweredAlert(unansweredQuestions);
      return;
    }
    
    // Calculate score and show results
    evaluateQuiz();
  });
} else {
  console.error('❌ Quiz form not found!');
}
// Show alert for unanswered questions
function showUnansweredAlert(questionNumbers) {
  // Scroll to first unanswered question
  const firstUnanswered = document.querySelector(`[data-question="q${questionNumbers[0]}"]`);
  if (firstUnanswered) {
    firstUnanswered.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Highlight unanswered questions briefly
    questionNumbers.forEach(num => {
      const questionDiv = document.querySelector(`[data-question="q${num}"]`);
      if (questionDiv) {
        questionDiv.style.animation = 'none';
        setTimeout(() => {
          questionDiv.style.animation = 'wrongShake 0.5s ease-out';
          questionDiv.style.borderLeftColor = 'var(--error-color)';
        }, 10);
        
        // Reset after animation
        setTimeout(() => {
          questionDiv.style.borderLeftColor = 'var(--primary-color)';
        }, 600);
      }
    });
  }
  
  alert(`Please answer all questions before submitting.\n\nUnanswered: Question${questionNumbers.length > 1 ? 's' : ''} ${questionNumbers.join(', ')}`);
}
// Evaluate quiz and show visual feedback
function evaluateQuiz() {
  let score = 0;
  
  // Disable form
  quizForm.classList.add('quiz-submitted');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="btn-text">Evaluating...</span>';
  
  // Check each question with slight delay for visual effect
  for (let i = 1; i <= 6; i++) {
    setTimeout(() => {
      const questionName = `q${i}`;
      const selectedInput = document.querySelector(`input[name="${questionName}"]:checked`);
      
      if (selectedInput) {
        const selectedLabel = selectedInput.closest('.option-label');
        const selectedValue = selectedInput.value;
        const correctValue = correctAnswers[questionName];
        
        // Find the correct answer label
        const correctInput = document.querySelector(`input[name="${questionName}"][value="${correctValue}"]`);
        const correctLabel = correctInput ? correctInput.closest('.option-label') : null;
        
        // Mark selected answer
        if (selectedValue === correctValue) {
          // Correct answer
          selectedLabel.classList.add('correct');
          score++;
        } else {
          // Wrong answer
          selectedLabel.classList.add('wrong');
          // Also highlight the correct answer
          if (correctLabel) {
            correctLabel.classList.add('correct');
          }
        }
      }
      
      // Show results after last question is evaluated
      if (i === 6) {
        setTimeout(() => {
          showResults(score);
        }, 500);
      }
    }, i * 200); // Stagger the feedback for visual effect
  }
}
// Show results summary
function showResults(score) {
  console.log(`✅ Quiz completed! Score: ${score}/6`);
  
  // Store score
  sessionStorage.setItem('quizScore', score);
  
  // Calculate discount based on score
  let discount = 25; // Default
  let discountedPrice = 31500;
  if (score >= 3) {
    discount = 50;
    discountedPrice = 21000;
  } else if (score < 3) {
    discount = 25;
    discountedPrice = 31500;
  }
  
  sessionStorage.setItem('discount', discount);
  
  // Update UI
  document.getElementById('scoreNumber').textContent = score;
  
  // Customize message based on score
  const scoreMessage = document.getElementById('scoreMessage');
  let message = '';
  let priceHTML = '';
  
  if (score >= 3) {
    message = '🎉 You have excellent cancer awareness. You qualify for 50% discount on SPOTMAS test!';
    priceHTML = '<div class="price-display"><span class="mrp-strikethrough">42,000 INR</span> <span class="discounted-price">21,000 INR</span></div>';
  } else {
    message = '📚 Thank you for participating! You qualify for 25% discount. Continue learning about cancer awareness!';
    priceHTML = '<div class="price-display"><span class="mrp-strikethrough">42,000 INR</span> <span class="discounted-price">31,500 INR</span></div>';
  }
  
  scoreMessage.innerHTML = message + priceHTML;
  
  // Hide submit button and show results
  submitBtn.style.display = 'none';
  resultsSummary.style.display = 'block';
  
  // Scroll to results
  setTimeout(() => {
    resultsSummary.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 300);
}
// Proceed to booking
if (proceedBtn) {
  proceedBtn.addEventListener('click', function() {
    console.log('🔄 Proceeding to booking page...');
    window.location.href = 'booking.html';
  });
}
// Prevent going back after quiz submission
window.addEventListener('beforeunload', function() {
  if (quizForm && quizForm.classList.contains('quiz-submitted')) {
    return 'Are you sure you want to leave? Your quiz results will be saved.';
  }
});
// Auto-scroll to top on page load
window.addEventListener('load', function() {
  window.scrollTo(0, 0);
});
