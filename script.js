window.addEventListener("scroll", function() {
    var scrollProgress = document.getElementById("scroll-progress");
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var windowHeight = window.innerHeight || document.documentElement.clientHeight;
    var docHeight = document.documentElement.scrollHeight;
  
    var scrollPercent = (scrollTop / (docHeight - windowHeight)) * 100;
  
    if (scrollPercent > 100) {
      scrollPercent = 100;
    }
  
    scrollProgress.style.height = scrollPercent + "%";
  
    if (scrollTop > 0) {
      scrollProgress.classList.add("scrolled");
    } else {
      scrollProgress.classList.remove("scrolled");
    }
  });