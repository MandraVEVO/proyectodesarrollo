import { Auth } from "src/auth/entities/user.entity";
import { Cupon } from "src/cupon/entities/cupon.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from "typeorm";


@Entity()
export class Empresa {

    @PrimaryColumn('uuid')
    id: string
    
    @Column('text',{
        unique: true
    })
    empresa: string;
    
    @Column('text')
    ubicacion: string;

    @OneToOne(()=>Auth, auth => auth.empresa)
    @JoinColumn({name: 'user_id'})
    user_id: Auth

    @OneToMany(
        () => Cupon, 
        (cupon) => cupon.empresa
    )
    cupones: Cupon[];
}
