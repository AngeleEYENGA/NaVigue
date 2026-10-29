(() => {
  'use strict';
  const core = window.NavigueNavigationCore;
  window.NavigueTransitDirections = {
    render(itinerary, options = {}) {
      const language = localStorage.getItem('navigueLanguage') || 'fr-FR';
      const draw = journey => {
        const steps = core.transitSteps(journey, language, {destination: options.destination});
        if (options.onSteps) { options.onSteps(steps); return; }
        const list = document.getElementById('stepList'); list.replaceChildren();
        steps.forEach((step, index) => {
          const item = document.createElement('li'); item.className = `step${index === 0 ? ' is-current' : ''}`;
          const icon = document.createElement('span'); icon.className = 'step-icon';
          icon.textContent = step.kind === 'walk' ? '🚶' : step.kind === 'wait' ? '◷' : step.kind === 'arrive' ? '✓' : '🚇';
          const content = document.createElement('div'), title = document.createElement('strong'), detail = document.createElement('small');
          title.textContent = step.title; detail.textContent = step.detail; content.append(title, detail); item.append(icon, content); list.append(item);
        });
      };
      draw(itinerary);
      core.fillStreetNames(itinerary).then(enriched => {
        if (enriched !== itinerary && (!options.isCurrent || options.isCurrent()) && language === (localStorage.getItem('navigueLanguage') || 'fr-FR')) draw(enriched);
      });
    }
  };
})();
