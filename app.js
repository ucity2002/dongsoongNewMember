// Supabase 클라이언트 설정
const supabase = createClient('https://qxvdwcdrljeglpyqqehm.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4dmR3Y2RybGplZ2xweXFxZWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxOTEwNDksImV4cCI6MjA3OTc2NzA0OX0.surzXw0eG3u-pVBeUe8_tUPK0gL0Y1EKPLwHlXtoptM');

// 사진 업로드 함수
async function uploadPhoto(file, userId) {
    const filePath = `photos/${userId}.jpg`;

    // Supabase Storage에 파일 업로드
    const { data, error } = await supabase.storage
        .from('member-photos')  // 버킷 이름
        .upload(filePath, file);  // 경로와 파일

    if (error) {
        console.error('사진 업로드 실패', error);
        return null;
    }

    // 업로드된 파일 URL 반환
    const fileUrl = `${supabase.storageUrl}/member-photos/${filePath}`;
    return fileUrl;
}

// 새가족 정보 저장 함수
async function saveMemberWithPhoto(memberData, file) {
    const fileUrl = await uploadPhoto(file, memberData.id);

    if (!fileUrl) {
        alert('사진 업로드 실패');
        return;
    }

    // DB에 새가족 정보와 사진 URL 저장
    const { data, error } = await supabase
        .from('members')
        .upsert({
            id: memberData.id,
            name: memberData.name,
            photo_url: fileUrl,  // 사진 URL 저장
            ...memberData
        });

    if (error) {
        console.error('새가족 정보 저장 실패', error);
    } else {
        console.log('새가족 정보 저장 성공');
        alert('새가족 등록 완료!');
        loadMembers();  // 새가족 목록 갱신
    }
}

// 새가족 등록 폼 제출 이벤트
document.getElementById('newMemberForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const gender = document.getElementById('gender').value;
    const birth = document.getElementById('birth').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const baptism = document.getElementById('baptism').checked;
    const photo = document.getElementById('photo').files[0];

    const memberData = {
        name,
        gender,
        birth,
        phone,
        address,
        baptism
    };

    // ID는 UUID로 생성
    memberData.id = crypto.randomUUID();

    // 새가족 정보와 사진 저장
    saveMemberWithPhoto(memberData, photo);
});

// 새가족 목록 로드 함수
async function loadMembers() {
    const { data, error } = await supabase
        .from('members')
        .select('*');

    if (error) {
        console.error('새가족 목록 불러오기 실패', error);
        return;
    }

    const membersList = document.getElementById('membersList');
    membersList.innerHTML = '';  // 기존 목록 초기화

    // 새가족 목록 표시
    data.forEach(member => {
        const memberDiv = document.createElement('div');
        memberDiv.classList.add('member');
        memberDiv.innerHTML = `
            <h3>${member.name}</h3>
            <p>성별: ${member.gender}</p>
            <p>생일: ${member.birth}</p>
            <p>전화번호: ${member.phone}</p>
            <p>주소: ${member.address}</p>
            <p>세례 여부: ${member.baptism ? 'O' : 'X'}</p>
            <img src="${member.photo_url}" alt="${member.name}'s photo" width="100">
        `;
        membersList.appendChild(memberDiv);
    });
}

// 새가족 목록 로드
loadMembers();
