const BASE_URL = `https://jsonplace-univclone.herokuapp.com`;

//returns the new url with .json()
function fetchUsers() {
  return fetchData(BASE_URL + "/users");
}

//if promise is fullfilled, then append the data to #user-list
fetchUsers().then(function (data) {
  renderUserList(data);
});

//template for rendering users for the aside
function renderUser(user) {
  let userElement = $(`<div class="user-card">
                <header>
                    <h2>${user.name}</h2>
                </header>
                <section class="company-info">
                    <p><b>Contact:</b> ${user.email}</p>
                    <p><b>Works for:</b> ${user.company.name}</p>
                    <p><b>Company creed:</b> "${user.company.catchPhrase}, which will ${user.company.bs}!"</p>
                </section>
                <footer>
                    <button class="load-posts">POSTS BY ${user.username}</button>
                    <button class="load-albums">ALBUMS BY ${user.username}</button>
                </footer>
            </div>`);
  userElement.data("user", user);
  return userElement;
}

//apends user to #user-list
function renderUserList(userList) {
  $("#user-list").empty();
  userList.forEach(function (user) {
    $("#user-list").append(renderUser(user));
  });
}

//click listener for when loading posts by the same user
$('#user-list').on('click', '.user-card .load-posts', function () {
    let parent = $(this).closest('.user-card');
    let grabbedUser = parent.data('user');
    fetchUserPosts(grabbedUser.id).then(renderPostList);
});

//click listener for loading albums by the same user
$('#user-list').on('click', '.user-card .load-albums', function () {
let parent = $(this).closest('.user-card');
let grabbedUser = parent.data('user');
fetchUserAlbumList(grabbedUser.id).then(renderAlbumList);
}); 

//click listener for loading comments related to post
$("#post-list").on("click", ".post-card .toggle-comments", function () {
  let postCardElement = $(this).closest(".post-card");
  let post = postCardElement.data("post");

  setCommentsOnPost(post)
  .then(function (post) {
    console.log('building comments for the first time...', post);
    let commentList = postCardElement.find(".comment-list");
    commentList.empty();
    post.comments.forEach(function(comment){
        $(commentList).append(`<h3>${comment.body} --- ${comment.email}</h3>`);
    });
    toggleComments(postCardElement);
  })
  .catch(function () {
    console.log('comments previously existed, only toggling...', post);
    toggleComments(postCardElement);
  });
});

//creates new custom URL for posts and comments
function fetchUserPosts(userId) {
  return fetchData(`${BASE_URL}/users/${userId}/posts?_expand=user`);
}
function fetchPostComments(postId) {
  return fetchData(`${BASE_URL}/posts/${postId}/comments`);
}

//Used to display comments on the post
function setCommentsOnPost(post) {
  // if we already have comments, don't fetch them again
  if (post.comments) {
    return Promise.reject(null);
  }
  // fetch, upgrade the post object, then return it
  return fetchPostComments(post.id).then(function (comments) {
    post.comments = comments;
    return post;
  });
}

//template used to render individual posts
function renderPost(post) {
  let userElement = $(`<div class="post-card">
        <header>
            <h3>${post.title}</h3>
            <h3>--- ${post.user.username}</h3>
        </header>
        <p>${post.body}</p>
        <footer>
            <div class="comment-list"></div>
            <a href="#" class="toggle-comments">(<span class="verb">show</span> comments)</a>
        </footer>
    </div>`);
    userElement.data("post", post);
    return userElement;
}

//adds post to post list
function renderPostList(postList) {
  $("#app section.active").removeClass("active");
  $("#post-list").empty();
  $("#post-list").addClass("active");
  postList.forEach(function (post) {
    $("#post-list").append(renderPost(post));
  });
}

//get an album list, or an array of albums
function fetchUserAlbumList(userId) {
  return fetchData(
    `${BASE_URL}/users/${userId}/albums?_expand=user&_embed=photos`
  );
}

//Toggles show/hide comments
function toggleComments(postCardElement) {
  const footerElement = postCardElement.find("footer");

  if (footerElement.hasClass("comments-open")) {
    footerElement.removeClass("comments-open");
    footerElement.find(".verb").text("show");
  } else {
    footerElement.addClass("comments-open");
    footerElement.find(".verb").text("hide");
  }
}

//render a single album 
function renderAlbum(album) {
  let albumCard = $(`<div class="album-card">
                <header>
                    <h3>${album.title}, by ${album.user.username}</h3>
                </header>
                <section class="photo-list"></section>
            </div>`);
  const photoList = albumCard.find(".photo-list");
  album.photos.forEach(function (photo) {
    $(photoList).append(renderPhoto(photo));
  });
  return albumCard;
}

//render a single photo
function renderPhoto(photo) {
  return $(`<div class="photo-card">
                    <a href="${photo.url}" target="_blank">
                        <img src="${photo.thumbnailUrl}">
                        <figure>${photo.title}</figure>
                    </a>
                </div>`);
}

//render an array of albums
function renderAlbumList(albumList) {
  $("#app section.active").removeClass("active");
  $("#album-list").addClass("active");
  $("#album-list").empty();
  albumList.forEach(function (album) {
    $("#album-list").append(renderAlbum(album));
  });
}

//Our main fetch used to take in a URL and return it as a json
function fetchData(url) {
  return fetch(url)
    .then(function (response) {
      return response.json();
    })
    .catch(function (error) {
      console.log(error);
    });
}

//Renders the aside
function bootstrap() {
  fetchUsers().then(renderUserList);
}
bootstrap();
