/**
 * DOM Helpers — shorthand utilities for common DOM operations.
 */

/** Shortcut for document.getElementById */
export function $(id) {
  return document.getElementById(id);
}

/** Shortcut for document.querySelectorAll (returns real Array) */
export function $$(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

/** 
 * Creates a DOM element with optional attributes, classes, and children.
 * @param {string} tag 
 * @param {Object} opts - { className, id, attrs, text, html, children, events }
 * @returns {HTMLElement}
 */
export function createElement(tag, opts = {}) {
  const el = document.createElement(tag);

  if (opts.className) el.className = opts.className;
  if (opts.id) el.id = opts.id;

  if (opts.attrs) {
    for (const [key, val] of Object.entries(opts.attrs)) {
      el.setAttribute(key, val);
    }
  }

  if (opts.text) el.textContent = opts.text;
  if (opts.html) el.innerHTML = opts.html;

  if (opts.children) {
    opts.children.forEach(child => {
      if (child instanceof HTMLElement) el.appendChild(child);
    });
  }

  if (opts.events) {
    for (const [event, handler] of Object.entries(opts.events)) {
      el.addEventListener(event, handler);
    }
  }

  return el;
}

/**
 * Sets innerHTML safely and returns the container for chaining.
 * @param {HTMLElement} el 
 * @param {string} html 
 */
export function setHTML(el, html) {
  el.innerHTML = html;
  return el;
}

/**
 * Formats a date string to pt-BR locale.
 * @param {string} dateStr — ISO date string
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

/**
 * Formats a full date in long pt-BR format.
 * @returns {string}
 */
export function formatFullDate() {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}
