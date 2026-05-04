import { FAQSection } from '../components/FAQSection'

export function FAQPage() {
    return (
        <div>
            <div style={{
                width: '100%',
                height: '420px',
                overflow: 'hidden',
            }}>
                <img
                    src="https://i.pinimg.com/1200x/34/b9/90/34b990b448c7aa48a199e7f7350f8a54.jpg"
                    alt="FAQ hero"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                    }}
                />
            </div>

            <div style={{ paddingTop: '60px' }}>
                <FAQSection />
            </div>
        </div>
    )
}