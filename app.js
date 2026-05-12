(function () {
  const $ = (id) => document.getElementById(id);

  const screens = {
    home:    $('home-screen'),
    quiz:    $('quiz-screen'),
    results: $('results-screen'),
  };

  let state = {
    quiz:       null,
    questions:  [],
    index:      0,
    score:      0,
    answered:   false,
  };

  function showScreen(name) {
    Object.values(screens).forEach((s) => s.classList.remove('active'));
    screens[name].classList.add('active');
  }

  function buildQuizList() {
    const grid = $('quiz-list');
    grid.innerHTML = '';
    (window.quizzes || []).forEach((quiz) => {
      const card = document.createElement('div');
      card.className = 'quiz-card';
      card.innerHTML = `
        <div class="card-flag">${quiz.flag}</div>
        <h3>${quiz.title}</h3>
        <p>${quiz.description}</p>
      `;
      card.addEventListener('click', () => startQuiz(quiz));
      grid.appendChild(card);
    });
  }

  function startQuiz(quiz) {
    state.quiz      = quiz;
    state.questions = shuffle([...quiz.questions]);
    state.index     = 0;
    state.score     = 0;
    state.answered  = false;

    $('quiz-title-label').textContent = quiz.title;
    $('feedback').className = 'feedback hidden';

    showScreen('quiz');
    renderQuestion();
  }

  function renderQuestion() {
    const q     = state.questions[state.index];
    const total = state.questions.length;

    $('progress-label').textContent = `${state.index + 1} / ${total}`;
    $('progress-bar').style.width   = `${((state.index) / total) * 100}%`;
    $('question-text').textContent  = q.question;
    $('feedback').className         = 'feedback hidden';
    state.answered = false;

    const list = $('options-list');
    list.innerHTML = '';
    shuffle([...q.options]).forEach((opt) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt;
      btn.addEventListener('click', () => selectOption(btn, opt, q));
      list.appendChild(btn);
    });
  }

  function selectOption(btn, selected, q) {
    if (state.answered) return;
    state.answered = true;

    const correct = selected === q.answer;
    if (correct) state.score++;

    document.querySelectorAll('.option-btn').forEach((b) => {
      b.disabled = true;
      if (b.textContent === q.answer) b.classList.add('correct');
    });
    if (!correct) btn.classList.add('wrong');

    const feedback = $('feedback');
    const text     = $('feedback-text');

    if (correct) {
      feedback.className = 'feedback correct-feedback';
      text.textContent   = `Correct! ${q.explanation}`;
    } else {
      feedback.className = 'feedback wrong-feedback';
      text.textContent   = `The correct answer is: ${q.answer}. ${q.explanation}`;
    }

    $('btn-next').textContent =
      state.index + 1 >= state.questions.length ? 'See Results' : 'Next';
  }

  function nextQuestion() {
    if (!state.answered) return;
    state.index++;
    if (state.index >= state.questions.length) {
      showResults();
    } else {
      renderQuestion();
    }
  }

  function showResults() {
    const total   = state.questions.length;
    const score   = state.score;
    const percent = Math.round((score / total) * 100);

    $('progress-bar').style.width = '100%';

    $('results-score').textContent   = `${score} / ${total} (${percent}%)`;
    $('score-icon').textContent      = scoreIcon(percent);
    $('results-message').textContent = scoreMessage(percent);

    showScreen('results');
  }

  function scoreIcon(pct) {
    if (pct === 100) return '🏆';
    if (pct >= 80)  return '⭐';
    if (pct >= 60)  return '👍';
    if (pct >= 40)  return '📚';
    return '💪';
  }

  function scoreMessage(pct) {
    if (pct === 100) return 'Perfect score! Outstanding knowledge!';
    if (pct >= 80)  return 'Excellent! You know your history well.';
    if (pct >= 60)  return 'Good job! A bit more study and you\'ll ace it.';
    if (pct >= 40)  return 'Not bad — keep learning and try again!';
    return 'Keep at it! Every attempt teaches you something new.';
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Event wiring
  $('btn-back').addEventListener('click', () => showScreen('home'));
  $('btn-next').addEventListener('click', nextQuestion);
  $('btn-retry').addEventListener('click', () => startQuiz(state.quiz));
  $('btn-home').addEventListener('click', () => showScreen('home'));

  // Boot
  buildQuizList();
  showScreen('home');
})();
