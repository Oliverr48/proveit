document.addEventListener('DOMContentLoaded', function () {
    const openInviteModalBtn = document.getElementById('openInviteModalBtn');
    const inviteModal = document.getElementById('inviteModal');
    const closeInviteModalBtn = document.getElementById('closeInviteModalBtn');
    const inviteUserForm = document.getElementById('inviteUserForm');
    const userSearchInput = document.getElementById('userSearch');
    const projectIdInput = document.getElementById('project_id'); // Hidden input for project ID

    // Open modal
    openInviteModalBtn.addEventListener('click', function () {
        inviteModal.classList.remove('hidden');
    });

    // Close modal
    closeInviteModalBtn.addEventListener('click', function () {
        inviteModal.classList.add('hidden');
    });

    // Handle form submission
    inviteUserForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const userSearch = userSearchInput.value.trim();
        const projectId = projectIdInput.value;

        if (!userSearch) {
            alert('Please enter a username or email.');
            return;
        }

        fetch('/invite_user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userSearch: userSearch,
                project_id: projectId,
            }),
        })
            .then((response) => response.json())

            .then((data) => {
                if (data.status === 'success') {
                    alert(data.message);
                    userSearchInput.value = ''; // Clear the input field
                    inviteModal.classList.add('hidden'); // Close the modal
                } else {
                    alert(data.message);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('An error occurred while inviting the user.');
            });
    });
});