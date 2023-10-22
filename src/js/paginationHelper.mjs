
export function renderPagination(page, totalPg, paginationContainer) {
  console.log(paginationContainer);
  paginationContainer.innerHTML = '';

  let pages = [1];
  for (let i = page - 2; i <= page + 2; i++) {
      if (i > 1 && i < totalPg) {
          pages.push(i);
      }
  }
  if (totalPg !== 1) {
      pages.push(totalPg);
  }

  if (page > 1) {
      let prevLink = document.createElement('a');
      prevLink.href = '#';
      prevLink.innerText = 'Previous';
      prevLink.dataset.page = page - 1;
      paginationContainer.appendChild(prevLink);
  }

  let lastPageRendered = 0;
  for (let p of pages) {
      if (lastPageRendered < p - 1) {
          let ellipsis = document.createElement('span');
          ellipsis.innerText = '...';
          paginationContainer.appendChild(ellipsis);
      }

      let pageLink = document.createElement('a');
      pageLink.href = '#';
      pageLink.innerText = p;
      pageLink.dataset.page = p;

      if (p === page) {
          pageLink.classList.add('current');
      }

      paginationContainer.appendChild(pageLink);
      lastPageRendered = p;
  }

  if (page < totalPg) {
      let nextLink = document.createElement('a');
      nextLink.href = '#';
      nextLink.innerText = 'Next';
      nextLink.dataset.page = page + 1;
      paginationContainer.appendChild(nextLink);
  }
}

