import { IsArray, IsInt } from "class-validator";
import { Auth } from "src/auth/entities/user.entity";
import { Cupon } from "src/cupon/entities/cupon.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Cliente {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column('int',
        {
            default: 0,
            nullable: false,
        }
    )
    puntos: number;

    @OneToOne(()=>Auth, auth => auth.cliente)
    @JoinColumn({ name: 'user_id' })
    user_id: Auth

    @ManyToMany(
        () => Cupon,
        (cupon) => cupon.clientes
    )
    @JoinTable({
        name: 'cliente_cupon', // nombre de la tabla intermedia
        joinColumn: {
            name: 'cliente_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'cupon_id',
            referencedColumnName: 'id'
        }
    })
    historial: Cupon[];
}
