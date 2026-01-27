// Correct answers
const correctAnswers = {
  q1: 'B',
  q2: 'B',
  q3: 'B',
  q4: 'B',
  q5: 'C',
  q6: 'C'
};

document.getElementById('quizForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  // Check if all questions are answered
  let allAnswered = true;
  for (let i = 1; i <= 6; i++) {
    const answer = document.querySelector(`input[name="q${i}"]:checked`);
    if (!answer) {
      allAnswered = false;
      break;
    }
  }
  
  if (!allAnswered) {
    alert('Please answer all questions before submitting.');
    return;
  }
  
  // Calculate score
  let score = 0;
  for (let i = 1; i <= 6; i++) {
    const answer = document.querySelector(`input[name="q${i}"]:checked`);
    if (answer && answer.value === correctAnswers[`q${i}`]) {
      score++;
    }
  }
  
  // Store score and redirect to results page
  sessionStorage.setItem('quizScore', score);
  window.location.href = 'results.html';
});