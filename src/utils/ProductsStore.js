import { db } from '../lib/firebaseClients';
import { collection, addDoc } from 'firebase/firestore';

// Your product array containing local paths
const localProducts = [
  { title: 'Butterfly Bracelet', img: '/Image/Bracelet/1.jpg', price: '$24.99', cat: 'bracelet', badge: 'New Arrival', reviews: '250 sold' },
  { title: 'Floral Butterfly Bracelet', img: '/Image/Bracelet/2.png', price: '$24.99', cat: 'bracelet', badge: 'Trending', reviews: '250 sold' },
  { title: 'Elegant Necklaces Collection', img: '/Image/Necklece/9.PNG', price: '$38.00', cat: 'necklace', badge: 'New Arrival', reviews: '125 sold' },
  { title: 'Möbius Bow Bell Bracelet', img: '/Image/Bracelet/3.jpg', price:'$23.89', cat: 'bracelet', badge:'Trending', reviews:'500 sold'},
  { title: 'Sweet Star-Encircled Butterfly Necklace', img: '/Image/Necklece/11.jpg', price:'$21.99', cat: 'necklace', badge:'New Arrival', reviews:'300 sold'},
  { title:'High-End Acetate Butterfly Hair Clip', img: '/Image/Hairclip/35.jpg', price: '$3.90', cat: 'hairclip', badge: 'New Arrival', reviews: '32 sold' },
  { title: 'Aesthetic Hairclip Bundle', img: '/Image/Hairclip/30.png', price: '$12.00', cat: 'hairclip', badge: 'New Arrival', reviews: '32 sold' },
  { title:'Bow hair clip', img: '/Image/Hairclip/40.jpg', price: '$2.80', cat: 'hairclip', badge: 'New Arrival', reviews: '10 sold'},
  { title: 'Rose moon Necklace', img:'/Image/Necklece/moon.PNG', price:'$22.99', cat:'necklace', badge:'', reviews:'80 sold'},
  { title:'Star Kitten Claw Bone Bracelet', img: '/Image/Bracelet/4.jpg', price:'$22.99', cat: 'bracelet', badge:'', reviews:'100 sold'},
  { title: 'Heart-Pounding', img: '/Image/Necklece/12.png', price: '$25.00', cat: 'necklace', badge: '', reviews: '100 sold' },
  { title:'Shark Clip Large Elegant' , img: '/Image/Hairclip/38.jpg', price: '$2.90', cat: 'hairclip', badge: '', reviews: '9 sold'},
  { title: 'Silver Star Necklace', img: '/Image/Necklece/13.PNG', price: '$25.00', cat: 'necklace', badge: '', reviews: '100 sold' },
  { title:'Shark Clip Bow' , img: '/Image/Hairclip/33.jpg', price: '$2.90', cat: 'hairclip', badge: '', reviews: '10 sold'},
  { title:'Crystal Bracelet, Forest Style, Sweet', img: '/Image/Bracelet/5.jpg', price:'$20.99', cat: 'bracelet', badge:'', reviews:'100 sold'},
  { title: 'Butterfly Wind Chime Tassel Hair Clip', img: '/Image/Hairclip/28.jpg', price: '$6.00', cat: 'hairclip', badge: '', reviews: '12 sold' },
  { title:'Crystal Friendship Bracelet', img: '/Image/Bracelet/6.jpg', price:'$25.99', cat: 'bracelet', badge:'Trending', reviews:'300 sold'},
  { title: 'Beating Heart Double Necklace', img: '/Image/Necklece/14.jpg', price:'$23.99', cat: 'necklace', badge:'Trending', reviews:'300 sold'},
  { title:'Valley Lily Leaf Bracelet', img: '/Image/Bracelet/7.jpg', price:'$22.50', cat: 'bracelet', badge:'', reviews:'90 sold'},
  { title:'Milk Lust Frosted Star Bracelet', img: '/Image/Bracelet/8.jpg', price:'$23.50', cat: 'bracelet', badge:'Trending', reviews:'180 sold'},
  { title: 'Elegant Bow and Heart Necklaces', img: '/Image/Necklece/bow.jpeg', price: '$23.00', cat: 'necklace', badge: '', reviews: '132 sold' },
  { title: 'Eight-Pointed Star Necklace', img: '/Image/Necklece/10.jpg', price: '$25.00', cat: 'necklace', badge: '', reviews: '124 sold' },
  { title: 'Twin Star Necklace', img: '/Image/Necklece/15.png', price:'$23.99', cat: 'necklace', badge:'New Arrival', reviews:'300 sold'},
  { title: 'Ceramic Beaded Rope Fortune Necklace', img: '/Image/Necklece/17.png', price:'$23.99', cat: 'necklace', badge:'', reviews:'300 sold'},
  { title: 'Hairpin Set Cute Pearl 6-Piece Set', img: '/Image/Hairclip/20.jpg', price: '$1.25', cat: 'hairclip', badge: '', reviews: '14 sold' },
  { title: 'Star Necklace Handmade', img:'/Image/Necklece/16.jpg', price:'$23.89', cat:'necklace', badge:'', reviews:'80 sold'},
  { title: 'Girls Hairpin Big Bow/Streamer', img: '/Image/Hairclip/22.jpg', price: '$1.25', cat: 'hairclip', badge: '', reviews: '14 sold' },
  { title: 'Elegant Swarovski Necklace', img:'/Image/Necklece/swan.jpeg', price:'$24.99', cat:'necklace', badge:'', reviews:'300 sold'},
  { title: 'Star Gradient Hairpin Sweet and Cool', img: '/Image/Hairclip/25.jpg', price: '$1.25', cat: 'hairclip', badge: '', reviews: '14 sold' },
  { title: 'Beaded Pearl Charm Bracelet', img: '/Image/Bracelet/2.png', price: '$2.50', cat: 'bracelet', badge: '', reviews: '45 sold' },
  { title: 'Y2k Hairpin', img: '/Image/Hairclip/y2k.jpeg', price: '$3.10', cat: 'hairclip', badge: '', reviews: '17 sold' },
  { title: 'Aesthetic Tulip Hair Tie', img: '/Image/Hairtie/36.jpg', price: '$4.50', cat: 'hairtie', badge: 'Hot Sale', reviews: '98 sold' },
  { title: 'Frangipani Hair Clip Set', img: '/Image/Hairclip/26.jpg', price: '$4.50', cat: 'hairclip', badge: '', reviews: '68 sold' },
  { title: 'Lace Hair Ring', img: '/Image/Hairtie/37.png', price: '$6.00', cat: 'hairtie', badge: '', reviews: '54 sold' },
  { title: 'Mesmerising Jewellery Bracelet', img: '/Image/Bracelet/m.jpeg', price: '$21.99', cat: 'bracelet', badge: '', reviews: '168 sold' },
  { title: 'Butterfly Hairpin', img: '/Image/Hairclip/b.jpeg', price: '$3.25', cat: 'hairclip', badge: '', reviews: '19 sold' },
];

export async function uploadAllProductsToFirestore() {
  try {
    console.log("Starting product upload to Firestore...");
    
    for (const [index, item] of localProducts.entries()) {
      await addDoc(collection(db, 'products'), {
        title: item.title,
        price: item.price,
        cat: item.cat,
        badge: item.badge,
        reviews: item.reviews,
        img: item.img, // Saves the local path link directly to Firebase database
        createdAt: new Date().toISOString()
      });
      console.log(`Uploaded (${index + 1}/36): ${item.title}`);
    }

    alert("All products successfully uploaded to Firestore database!");
  } catch (error) {
    console.error("Error uploading products: ", error);
    alert("Upload failed: " + error.message);
  }
}