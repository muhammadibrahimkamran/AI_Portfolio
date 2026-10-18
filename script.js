(function(){
  if(!window.firebase){ return; }
  var firebaseConfig = {
    apiKey: "AIzaSyDgZu6d02aSLYQDtdR-bismr9mEF9K5LlY",
    authDomain: "myportfolio-767a5.firebaseapp.com",
    projectId: "myportfolio-767a5",
    storageBucket: "myportfolio-767a5.appspot.com",
    messagingSenderId: "427590589348",
    appId: "1:427590589348:web:94badec42409e3dc81bf31",
    measurementId: "G-7ZW67XG6CB"
  };
  if(!firebase.apps.length){ firebase.initializeApp(firebaseConfig); }
  var db = firebase.firestore();

  var track = document.getElementById('reviewTrack');
  var marquee = document.getElementById('reviewMarquee');
  var modal = document.getElementById('reviewModal');
  var openBtn = document.getElementById('openReview');
  var closeBtn = document.getElementById('closeReview');
  var form = document.getElementById('reviewForm');
  var msg = document.getElementById('reviewMsg');
  var ratingInput = document.getElementById('ratingInput');
  var starPicker = document.getElementById('starPicker');

  function stars(n){ var s=''; for(var i=0;i<5;i++){ s += (i < n) ? '★' : '☆'; } return s; }

  function card(r){
    var div = document.createElement('div');
    div.className = 'review-card';
    var av = (r.name || '?').trim().charAt(0).toUpperCase();
    var social = r.social ? '<div class="social">'+r.social+'</div>' : '';
    div.innerHTML = '<div class="stars">'+stars(r.rating||5)+'</div>'+
      '<div class="msg">'+(r.message||'')+'</div>'+
      '<div class="who"><div class="av">'+av+'</div><div class="meta"><b>'+(r.name||'Anonymous')+'</b><small>Client</small></div></div>'+social;
    return div;
  }

  function render(list){
    if(!track) return;
    track.innerHTML = '';
    if(!list.length){
      var empty = document.createElement('div');
      empty.className = 'review-card';
      empty.innerHTML = '<div class="msg">No reviews yet. Be the first to leave one!</div>';
      track.appendChild(empty);
      return;
    }
    list.forEach(function(r){ track.appendChild(card(r)); });
  }

  if(db){
    db.collection('reviews').orderBy('createdAt','desc').onSnapshot(function(snap){
      var seen = {};
      var list = [];
      snap.forEach(function(doc){
        var d = doc.data();
        var key = (d.name||'') + '|' + (d.message||'');
        if(seen[key]) return;
        seen[key] = true;
        list.push(d);
      });
      render(list);
    }, function(err){ console.error(err); });
  }

  if(openBtn && modal){
    openBtn.addEventListener('click', function(){ modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); });
  }
  if(closeBtn && modal){
    closeBtn.addEventListener('click', function(){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); });
  }
  if(modal){
    modal.addEventListener('click', function(e){ if(e.target === modal){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); } });
  }

  if(starPicker && ratingInput){
    var btns = starPicker.querySelectorAll('button');
    function setRating(v){
      ratingInput.value = v;
      btns.forEach(function(b){ b.classList.toggle('active', +b.dataset.value <= v); });
    }
    setRating(5);
    btns.forEach(function(b){
      b.addEventListener('click', function(){ setRating(+b.dataset.value); });
    });
  }

  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var data = {
        name: form.name.value.trim(),
        message: form.message.value.trim(),
        rating: parseInt(ratingInput.value,10) || 5,
        social: form.social.value.trim(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      db.collection('reviews').add(data).then(function(){
        if(msg) msg.textContent = 'Thank you for your review!';
        form.reset();
        if(starPicker) { var b = starPicker.querySelectorAll('button'); b.forEach(function(x){ x.classList.add('active'); }); }
        if(ratingInput) ratingInput.value = 5;
        setTimeout(function(){ if(modal){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); } if(msg) msg.textContent=''; }, 1200);
      }).catch(function(err){ if(msg) msg.textContent = 'Could not submit. Try again.'; console.error(err); });
    });
  }
})();